import { Box, 
        Button, 
        ButtonProps, 
        makeStyles, 
        MenuItem, 
        TextField, 
        Theme } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from '../../util/vendor/yup';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router';
import { Category, Genre } from '../../util/models';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string()
        .label("Nome")
        .required()
        .max(255),
    categories_id: yup.array()
        .label("Categorias")
        .required()
});

export const Form = () => {

    const { 
        register,
        handleSubmit, 
        getValues, 
        setValue,
        formState:{ errors }, 
        reset, 
        watch
    } = useForm({
            resolver: yupResolver(validationSchema),
            defaultValues: {
                name: "",
                categories_id: [] as any as string[]
            }
        });


    const classes = useStyles();    
    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} : any = useParams();
    const [genre, setGenre] = useState<Genre | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);    

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: "contained",
    };    

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            const promises = [categoryHttp.list({queryParams: {all: ''}})];
            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);
                if(isSubscribed) {
                    setCategories(categoriesResponse.data.data);
                    if (id) {
                        setGenre(genreResponse.data.data);
                        const categories_id = genreResponse.data.data.categories.map(category => category.id);
                        reset({
                            ...genreResponse.data.data,
                            categories_id
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error',}
                )
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, []);

    useEffect(() => {
        register("categories_id")
    }, [register]);

    async function onSubmit(formData, event) {
        setLoading(true);
        console.log(formData)
        try {
            const http = !genre
                ? genreHttp.create(formData)
                : genreHttp.update(genre.id, formData);
            const {data} = await http;
            snackbar.enqueueSnackbar(
                'Gênero salvo com sucesso',
                {variant: 'success'}
            );
            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace(`/genres/${data.data.id}/edit`)
                            : history.push(`/genres/${data.data.id}/edit`)
                    )
                    : history.push('/genres')
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar(
                'Não foi possível salvar o gênero',
                {variant: 'error'}
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}
                label="Nome"
                fullWidth
                variant={"outlined"}
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />
            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={'normal'}
                variant={'outlined'}
                fullWidth
                onChange={(e) => {
                    setValue('categories_id', e.target.value as any as string[])                    
                }}
                SelectProps={{
                    multiple: true
                }}
                disabled={loading}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && (errors.categories_id as any).message}
                
                InputLabelProps={{shrink: true}}
            >
                <MenuItem value="" disabled>
                    <em>Seleciona categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>
            <Box dir={"rtl"}>                
                <Button 
                    color={"primary"}
                    {...buttonProps} 
                    onClick={() => onSubmit(getValues(), null)}
                >
                    Salvar
                </Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
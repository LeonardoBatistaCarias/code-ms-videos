import { Box, Button, ButtonProps, Checkbox, FormControlLabel, makeStyles, TextField, Theme } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from '../../util/vendor/yup';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useSnackbar } from 'notistack';

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
});

export const Form = () => {
    const { register,
            getValues, 
            setValue,
            handleSubmit, 
            formState:{ errors }, 
            reset, 
            watch
        } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } : any = useParams();
    const [category, setCategory] = useState<{id: string} | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: "contained",
        disabled: loading
    };    

    useEffect(() => {
        register("is_active")
    }, [register]);

    useEffect(() => {
        if(!id) {
            return;
        }
        async function getCategory() {
            setLoading(true);
            try {
                const {data} = await categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);
            } catch(error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Nao foi possível carregar as informações',
                    {variant: 'error'}
                );
            } finally {
                setLoading(false);
            }            
        }
        
        getCategory();
    }, []);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !category
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData)
            const {data} = await http; 
            snackbar.enqueueSnackbar(
                'Categoria salva com sucesso',
                {variant: 'success'}
            );
            setTimeout(() => {
                event 
                    ? (
                        id
                            ? history.replace(`/categories/${data.data.id}/edit`)
                            : history.push(`/categories/${data.data.id}/edit`)
                    )
                    : history.push("/categories")                    
                })
        } catch(error) {
            console.error(error);
            snackbar.enqueueSnackbar(
                'Não foi possível salvar a Categoria',
                {variant: 'error'}
            )            
        } finally {
            setLoading(false);
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
                {...register("description")}
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant={"outlined"}
                margin={"normal"}
                disabled={loading}
                InputLabelProps={{shrink: true}}
            />
            <FormControlLabel
                disabled={loading}
                control={
                    <Checkbox
                        color={"primary"}
                        onChange={
                            () => setValue('is_active', !getValues()['is_active'])
                        }
                        checked={watch('is_active')}                        
                    />
                }
                label={'Ativo?'}
                labelPlacement={'end'}
            />            
            <Box dir={"rtl"}>                
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
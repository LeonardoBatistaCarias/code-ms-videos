import { Box, Button, ButtonProps, makeStyles, MenuItem, TextField, Theme } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

export const Form = () => {

    const classes = useStyles();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        variant: "outlined",        
    };

    const [categories, setCategories] = useState<any[]>([]);
    const { register, handleSubmit, getValues, setValue, watch } = useForm({
        defaultValues: {
            name: "",
            categories_id: [] as string[]
        }
    });
    
    useEffect(() => {
        register("categories_id")
    }, [register])

    useEffect(() => {
        categoryHttp
            .list()
            .then(({data}) => setCategories(data.data))
    }, [])

    function onSubmit(formData, event) {
        console.log(event)
        genreHttp
            .create(formData)
            .then((response) => console.log(response));
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}                
                label="Nome"
                fullWidth
                variant={"outlined"}                
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
                    setValue('categories_id', e.target.value as unknown as string[])
                    console.log(getValues()['categories_id'])
                }}
                SelectProps={{
                    multiple: true
                }}
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
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
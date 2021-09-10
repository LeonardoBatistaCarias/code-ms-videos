import {Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from '../../util/vendor/yup';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { Category } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import { DefaultForm } from '../../components/DefaultForm';

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
            watch,
            trigger
        } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } : any = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        register("is_active")
    }, [register]);

    useEffect(() => {
        if(!id) {
            return;
        }
        (async function getCategory() {
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
        })();
        
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
        <DefaultForm GridItemProps={{xs: 12, md: 6}} onSubmit={handleSubmit(onSubmit)}>
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
            <SubmitActions 
                disabledButtons={loading} 
                handleSave={() => trigger().then(isValid => {
                    isValid && onSubmit(getValues(), null) 
                })}
            />
        </DefaultForm>
    );
};
import { Card, CardContent, Checkbox, FormControlLabel, FormHelperText, Grid, makeStyles, TextField, Theme, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from '../../../util/vendor/yup';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import SubmitActions from '../../../components/SubmitActions';
import { DefaultForm } from '../../../components/DefaultForm';
import videoHttp from '../../../util/http/video-http';
import { Video, VideoFileFieldsMap } from '../../../util/models';
import { RatingField } from './RatingField';
import UploadField from './UploadFile';
import GenreField from './GenreField';
import CategoryField from './CategoryField';

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
    },
}));

const validationSchema = yup.object().shape({
    title: yup.string()
            .label("Nome")
            .required()
            .max(255),
    description: yup.string()
        .label("Sinopse")
        .required(),
    year_launched: yup.number()
        .label("Ano de lançamento")
        .required(),
    duration: yup.number()
        .label("Duração")
        .required()
        .min(1),
    genres: yup.array()
        .label('Gêneros')
        .required(),
    categories: yup.array()
        .label('Categorias')
        .required(),
    rating: yup.string()
        .label("Classificação")
        .required()
});

const fileFields = Object.keys(VideoFileFieldsMap);

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
        resolver: yupResolver(validationSchema),        
    });

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } : any = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    useEffect(() => {
        ['rating', 
         'opened',
         'genres',
         'categories',
          ...fileFields
        ].forEach(name => register(name));
    }, [register]);

    useEffect(() => {
        if(!id) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const {data} = await videoHttp.get(id);
                if(isSubscribed) {
                    setVideo(data.data);
                    reset(data.data);
                }
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
        return () => {
            isSubscribed = false;
        }
    }, []);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video
            ? videoHttp.create(formData)
            : videoHttp.update(video.id, formData)
            const {data} = await http; 
            snackbar.enqueueSnackbar(
                'Categoria salva com sucesso',
                {variant: 'success'}
            );
            setTimeout(() => {
                event 
                    ? (
                        id
                            ? history.replace(`/videos/${data.data.id}/edit`)
                            : history.push(`/videos/${data.data.id}/edit`)
                    )
                    : history.push("/videos")                    
                })
        } catch(error) {
            console.error(error);
            snackbar.enqueueSnackbar(
                'Não foi possível salvar a vídeo',
                {variant: 'error'}
            )            
        } finally {
            setLoading(false);
        }
    }

    return (
        <DefaultForm 
            GridItemProps={{xs: 12}} 
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        {...register("title")}
                        label="Título"
                        variant={"outlined"}
                        fullWidth                    
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}                 
                    />
                    <TextField                
                        {...register("description")}
                        label="Sinopse"
                        multiline
                        rows="4"
                        fullWidth
                        variant={"outlined"}
                        margin={"normal"}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField                
                                {...register("year_launched")}
                                label="Ano de Lançamento"
                                type="number"
                                margin={"normal"}
                                variant={"outlined"}
                                fullWidth
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField                
                                {...register("duration")}
                                label="Duração"
                                type="number"
                                margin={"normal"}
                                variant={"outlined"}
                                fullWidth
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br/>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                genres={watch('genres')}
                                setGenres={(value) => setValue('genres', value)}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value)}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField 
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value)}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                    <br />
                    <RatingField
                        value={watch('rating')}
                        setValue={(value) => setValue('rating', value)}
                        error={errors.rating}
                        disabled={loading}
                        FormControlProps={{
                            margin: isGreaterMd ? 'none' : 'normal'
                        }}
                    />
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField
                                //ref={uploadsRef.current['thumb_file']}
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value) => setValue('thumb_file', value)}
                            />
                            <UploadField
                                // ref={uploadsRef.current['banner_file']}
                                accept={'image/*'}
                                label={'Banner'}
                                setValue={(value) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Videos
                            </Typography>
                            <UploadField
                                // ref={uploadsRef.current['trailer_file']}
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value) => setValue('trailer_file', value)}
                            />
                            <UploadField
                                // ref={uploadsRef.current['video_file']}
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value) => {
                                    setValue('video_file', value)
                                    console.log(getValues());
                                }}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="opened"
                                        color={'primary'}
                                        onChange={
                                            () => setValue('opened', !getValues()['opened'])
                                        }
                                        checked={watch('opened')}
                                        disabled={loading}
                                    />
                                }
                                label={
                                    <Typography color="primary" variant={"subtitle2"}>
                                        Quero que este conteúdo apareça na seção lançamentos
                                    </Typography>
                                }
                                labelPlacement="end"
                            />
                        </CardContent>
                    </Card>
                    <br />
                    <FormControlLabel                        
                        control={
                            <Checkbox
                            {...register("opened")}
                                color={"primary"}                        
                                onChange={
                                    () => setValue('opened', !getValues()['opened'])
                                }
                                checked={watch('opened')}
                                disabled={loading}                
                            />
                        }
                        label={
                            <Typography color={"primary"} variant={"subtitle2"}>
                                Quero que este conteúdo apareça na seção lançamentos
                            </Typography>
                        }
                        labelPlacement={'end'}
                    />                    
                </Grid>   
            </Grid>
            <SubmitActions 
                disabledButtons={loading} 
                handleSave={() => 
                    trigger().then(isValid => {
                    isValid && onSubmit(getValues(), null) 
                })}
            />                    
        </DefaultForm>
    );
};
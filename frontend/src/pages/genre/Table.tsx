import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import genreHttp from '../../util/http/genre-http';
import { Genre, ListResponse } from '../../util/models';
import DefaultTable, {makeActionStyles, TableColumn} from '../../components/Table'
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
            filter: false,
        },
    },
    {
        name: "name",
        label: "Nome",
        width: "43%",
        options: {
            filter: false,
        },
    },
    {
        name: "categories",
        label: "Categorias",
        width: '20%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value.map(value => value.name).join(', ');
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: '10%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: '13%',
        options: {
            filter: false,
            sort: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <span>
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                </span>
                )
            }
        }
    }
];

type Props = {};
const Table = (props: Props) => {

    const snackbar = useSnackbar();
    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect( () => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const { data } = await genreHttp.list<ListResponse<Genre>>();
                if(isSubscribed) {
                    setData(data.data);
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: 'error'}
                )
            } finally {
                setLoading(false);
            }            
        })();

        return () => {
            isSubscribed = false;
        }
    }, []);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title="Listagem de gêneros"
                columns={columnsDefinition}
                data={data}
                loading={loading}
                options={{
                    responsive: 'simple'
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
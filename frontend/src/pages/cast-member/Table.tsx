import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { CastMember, CastMemberTypeMap, ListResponse } from '../../util/models';
import castMemberHttp from '../../util/http/cast-member-http';
import { Link } from 'react-router-dom';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import DefaultTable, {makeActionStyles, TableColumn} from '../../components/Table'
import EditIcon from '@material-ui/icons/Edit';
import { useSnackbar } from 'notistack';
import { MuiDataTableRefComponent } from '../category/Table';
import useFilter from '../../hooks/useFilter';
import * as yup from '../../util/vendor/yup';

const castMemberNames = Object.values(CastMemberTypeMap);

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
        name: "type",
        label: "Tipo",
        width: "4%",
        options: {
            customBodyRender: (value, tableMeta, updateValue) => {            
                return CastMemberTypeMap[value];
            },
        },
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>;
            },
        },
    },
    {
      name: "actions",
      label: "Ações",
      width: "13%",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <span>
              <IconButton
                color={"secondary"}
                component={Link}
                to={`/cast-members/${tableMeta.rowData[0]}/edit`}
              >
                <EditIcon />
              </IconButton>
            </span>
          );
        },
      },
    },
];

type Props = {};
const Table = (props: Props) => {

    const debounceTime = 300;
    const debouncedSearchTime = 300;
    const rowsPerPage = 15;
    const rowsPerPageOptions = [15, 25, 50];
    const snackbar = useSnackbar();
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = React.useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    
    const {
        columns,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords,
    } = useFilter(
        {
            columns: columnsDefinition,
            debounceTime: debounceTime,
            rowsPerPage,
            rowsPerPageOptions,
            tableRef,
            extraFilter: {
                createValidationSchema: () => {
                    return yup.object().shape({
                        type: yup.string()
                                .nullable()                                
                                .transform(value => {
                                    return !value || !castMemberNames.includes(value)? undefined: value;
                                })
                                .default(null)
                    })
                },
                formatSearchParams: (debouncedState) => {
                    return debouncedState.extraFilter 
                        ? {
                            ...(
                                debouncedState.extraFilter.type &&
                                {type: debouncedState.extraFilter.type}
                            )
                        } : undefined
                },
                getStateFromURL: (queryParams) => {
                    return {
                        type: queryParams.get('type')
                    }
                }
            }
        }
    );
    
    useEffect( () => {
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const { data } = await castMemberHttp.list<ListResponse<CastMember>>();
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
                title="Listagem de membros de elenco"
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
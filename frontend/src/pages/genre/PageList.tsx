import { Box, Fab } from '@material-ui/core';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../components/Page';
import AddIcon from '@material-ui/icons/Add'
import  Table from './Table';

const PageList = () => {
    return (
        <Page title={'Listagem de gêneros'}>
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title="Adicionar gênero"
                    color={"secondary"}
                    size="small"
                    component={Link}
                    to="genres/create"
                >
                    <AddIcon />
                </Fab>
            </Box>
            <Box>
                <Table></Table>
            </Box>
        </Page>

    );
};

export default PageList;
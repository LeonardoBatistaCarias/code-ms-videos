import * as React from 'react';
import { Page } from '../../components/Page';
import { Form } from './Form';
import {useParams} from 'react-router';

const PageForm = () => {
    const { id } : any = useParams();
    return (
        <Page title={!id ? 'Criar categoria' : 'Editar Categoria'}>
            <Form />
        </Page>

    );
};

export default PageForm;
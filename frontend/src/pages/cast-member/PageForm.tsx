import * as React from 'react';
import { useParams } from 'react-router';
import { Page } from '../../components/Page';
import { Form } from './Form';


const PageForm = () => {
    const { id } : any = useParams();
    return (
        <Page title={!id ? 'Criar membro elenco' : 'Editar membro elenco'}>
            <Form />
        </Page>

    );
};

export default PageForm;
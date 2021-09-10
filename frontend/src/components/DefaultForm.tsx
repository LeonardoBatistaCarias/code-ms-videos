import { Grid, GridProps } from '@material-ui/core';
import * as React from 'react';

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    GridContainerProps?: GridProps;
    GridItemProps?: GridProps;
}

export const DefaultForm : React.FC<DefaultFormProps> = (props) => {
    const {GridContainerProps, GridItemProps, ...other} = props;
    return (
        <form>
            <Grid container {...GridContainerProps}>
                <Grid item {...GridItemProps}>  
                    {props.children} 
                </Grid>
            </Grid>
        </form>
    );
};
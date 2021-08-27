import { Container, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles({
    title: {
        color: '#999999'
    }
});

type PageProps = {
    title: string
};

export const Page:React.FC<PageProps> = (props) => {
    const classes = useStyles();
    return (
        <div>
            <Container>
                <Typography className={classes.title} variant="h5">
                    {props.title}
                </Typography>
            </Container>
        </div>
    );
};
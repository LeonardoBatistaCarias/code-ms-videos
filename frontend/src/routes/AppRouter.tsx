import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import routes from './index';
type Props = {
    
};
export const AppRouter = (props: Props) => {
    return (
        <Switch>
            {
                routes.map(
                    (route, key) => (
                        <Route 
                            key={key}
                            path={route.path}
                            component={route.component}
                            exact={route.exact === true}
                        />
                    )
                )
            }
        </Switch>
    );
};

export default AppRouter;
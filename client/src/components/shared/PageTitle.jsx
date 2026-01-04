import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const PageTitle = ({ title }) => {
    const fullTitle = title || 'CherryPick';
    useEffect(() => {
        document.title = fullTitle;
    }, [fullTitle]);

    return (
        <Helmet>
            <title>{fullTitle}</title>
        </Helmet>
    );
};

export default PageTitle;
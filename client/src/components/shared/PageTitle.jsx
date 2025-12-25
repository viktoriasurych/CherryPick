import { Helmet } from 'react-helmet-async';

const PageTitle = ({ title }) => {
    return (
        <Helmet>
            <title>{title} | Art Archive</title>
        </Helmet>
    );
};

export default PageTitle;
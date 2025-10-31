import BodyCropsPage from '@/components/Crops/Body';
import Head from 'next/head';

const Crops = () => {
 
    return (
        <>
            <Head>
                <title>All Crops</title>
                <meta name="description" content="A list of all available crops." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <BodyCropsPage />

        </>
    );
};

export default Crops;
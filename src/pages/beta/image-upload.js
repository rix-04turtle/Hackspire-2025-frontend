import BodyCropDoctor from '@/components/beta/BodyCropDoctor'
import Head from 'next/head'
import Link from 'next/link'
import React from 'react'

const ImageUpload = () => {
    

    return (
        <>
            <Head>
                <title>Crop Doctor | Gemini</title>
            </Head>

            <BodyCropDoctor />
        </>
    )
}

export default ImageUpload
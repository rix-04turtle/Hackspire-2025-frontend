import Bodysignup from '@/components/signup/Bodysignup'
import Head from 'next/head'

const signup = () => {
  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign Up your account now" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Bodysignup />
    </>
  )
}

export default signup
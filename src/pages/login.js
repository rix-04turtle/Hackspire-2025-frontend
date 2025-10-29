import BodyLogin from '@/components/Login/BodyLogin'
import Head from 'next/head'

const Login = () => {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BodyLogin />
    </>
  )
}

export default Login
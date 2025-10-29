import React from 'react'

const HomeApp = () => {
  const PAGES = [
    { name: 'Home', path: '/' },
    { name: 'Login', path: '/login' },
  ]

  return (
    <div>
      <h1>Farming Helper App</h1>

      <h3 >All the pages in the App</h3>
      <ol className="list pl-4 space-y-2">
        {PAGES.map((page) => (
          <li className="list-item bg-gray-100 p-2 rounded-md" key={page.path}>
            <a className="text-blue-500 hover:underline hover:text-blue-700 transition-colors" target='_blank' href={page.path}>{page.name} [ {page.path} ]</a>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default HomeApp
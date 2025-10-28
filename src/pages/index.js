import React from 'react'

const HomeApp = () => {
  const PAGES = [
    { name: 'Home', path: '/' },
  ]

  return (
    <div>
      <h1>Farming Helper App</h1>

      <h3 >All the pages in the App</h3>
      <ol>
        {PAGES.map((page) => (
          <li key={page.path}>
            <a href={page.path}>{page.name}</a>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default HomeApp
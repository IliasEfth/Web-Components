<template>
  <header class="page-header">
    <h1>Shop Back Office</h1>
    <p>Act 2 · the Vue host. Angular, React and Vue components, loaded at runtime.</p>
    <nav class="page-nav">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/orders">Orders</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

'use client';

export default function Error({ error }) {
  return (
    <main className='error'>
      <h1>An error occurred!</h1>
      <p>Failed to getch meal data. Please to try again later</p>
    </main>
  );
}

import { accent, content, description, intro, title } from './home-page.css';

export function HomePage() {
  return (
    <main className={content}>
      <section className={intro} aria-labelledby="home-title">
        <h1 id="home-title" className={title}>
          YAPP+
        </h1>
        <p className={description}>함께 만드는 순간을 더 가까이.</p>
        <div className={accent} aria-hidden="true" />
      </section>
    </main>
  );
}

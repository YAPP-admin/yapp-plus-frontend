import { accent, content, description, header, intro, page, title, wordmark } from './page.css';

export default function HomePage() {
  return (
    <div className={page}>
      <header className={header}>
        <span className={wordmark}>YAPP+</span>
      </header>

      <main className={content}>
        <section className={intro} aria-labelledby="home-title">
          <h1 id="home-title" className={title}>
            YAPP+
          </h1>
          <p className={description}>함께 만드는 순간을 더 가까이.</p>
          <div className={accent} aria-hidden="true" />
        </section>
      </main>
    </div>
  );
}

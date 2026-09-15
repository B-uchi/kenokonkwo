import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Biography",
};

export default function BiographyPage() {
  return (
    <article className="bio">
      <header style={{ textAlign: "center" }}>
        <p className="eyebrow">Biography</p>
        <h1 className="page-title">A life of service</h1>
        <p className="bio-dates">
          3 SEPTEMBER 1949 &nbsp;&ndash;&nbsp; 10 SEPTEMBER 2026
        </p>
        <div className="gold-rule bio-rule" />
      </header>

      <p className="bio-lead">
        He was born in September 1949, Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quidem repellendus possimus cumque eius debitis ipsa sunt impedit dicta odit dignissimos.
      </p>

      <p className="bio-body">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Praesentium quo doloribus soluta. Iure accusamus quam minima cum ullam sed deleniti.
      </p>

      <h2>Family</h2>
      <p className="bio-body">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam, dicta? Doloremque, quia non! Non maxime laboriosam provident voluptatibus fugit, rem perferendis nesciunt numquam fugiat maiores necessitatibus dolores veniam nemo hic. Aspernatur cumque aut ea nulla atque possimus error fugit quaerat quisquam doloribus necessitatibus tenetur laborum nam perferendis quasi, rem enim.
      </p>

      <h2 style={{ marginTop: 36 }}>Faith and community</h2>
      <p className="bio-body">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus unde, praesentium magnam, nisi laudantium atque dolorem, mollitia culpa reiciendis laboriosam in architecto excepturi. Amet rem aspernatur vel dolorum nobis consectetur quae? Consequatur at, porro ipsum nostrum repellat error deleniti? Maxime eius praesentium exercitationem esse impedit. Aut repellendus voluptatibus animi nihil? Fuga atque culpa numquam beatae vero excepturi est unde nisi quos adipisci. Rem inventore sequi dolorum iusto asperiores amet quae.
      </p>

      <figure>
        <blockquote>
          A kind soul who touched our hearts, inspired our lives and will
          forever remain in our memories.
        </blockquote>
        <figcaption>The Okonkwo family</figcaption>
      </figure>

      <h2>Later years</h2>
      <p className="bio-body">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime, incidunt soluta blanditiis labore unde sapiente libero dolore suscipit voluptatibus. Sequi excepturi consequuntur adipisci tempora voluptatibus distinctio at soluta debitis iusto.
      </p>

      <div className="bio-links">
        <Link href="/tributes" className="btn-outline">
          Read tributes
        </Link>
        <Link href="/photos" className="btn-outline">
          View photographs
        </Link>
      </div>
    </article>
  );
}

import fs from 'node:fs';

import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';

const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error('Fetching meals error');
  return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
  return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
}

export async function saveMeal(meal) {
  // because meal slug doesnt exist in input field so we are creating it manually here.
  meal.slug = slugify(meal.title, { lower: true });
  // because the meal instructions is vulnerable to cross site reference so we to XSS to protect it.
  meal.instructions = xss(meal.instructions);

  // this will rename the image slug so we can use it to save it in public/images
  const extension = meal.image.name.split('.').pop();
  const fileName = `${meal.slug}.${extension}`;
  // this will help us save image in public/images
  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();
  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error('saving image failed');
    }
  });

  // this is to save simply the path where the image will be found
  meal.image = `/images/${fileName}`;
  // this will save the data into db.
  db.prepare(
    `
  INSERT INTO meals (title, summary, instructions, creator, creator_email, image, slug) VALUES (
    @title,
    @summary,
    @instructions,
    @creator,
    @creator_email,
    @image,
    @slug)`
  ).run(meal);
}

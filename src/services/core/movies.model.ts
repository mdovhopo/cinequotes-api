import { compressMovieName } from '../../util';
import { Firestore }         from '@google-cloud/firestore';

export type Movie = {
  id: string;
  title: string;
};

export const MovieModelFactory =  (
  firestore: Firestore
) => {
  const getMovies = async (): Promise<Array<Movie>> => {
    const collection = await firestore.collection('movies').get();
    return collection.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
  };

  /**
   *
   * @param title
   * @param forceCreate - if true, movie will be created even if same move already exists
   */

  const createIfNotExistsMovie = async (title: string, forceCreate = false): Promise<Movie> => {
    const existingMovieRef = await firestore
      .collection('movies')
      .where('titleHash', '==', compressMovieName(title))
      .get();

    // if movie found, just return it
    if (!forceCreate && existingMovieRef.docs.length > 0) {
      const [ doc ] = existingMovieRef.docs;
      return {
        id:    doc.id,
        title: doc.data().title
      };
    }

    const docRef = await firestore
      .collection('movies')
      // store titleHash additionally, because firestore does not allow case insensitive search
      .add({ title, titleHash: title.replace(/\s/g, '').toLowerCase() });
    return {
      id:    docRef.id,
      title: title
    };
  };

  return {
    getMovies,
    createIfNotExistsMovie
  };
}




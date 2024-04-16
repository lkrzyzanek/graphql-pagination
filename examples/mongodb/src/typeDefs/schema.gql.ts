import gql from 'graphql-tag';

const schema = gql`
    enum CacheControlScope {
        PUBLIC
        PRIVATE
    }
    directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
        inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
    
    type Book @cacheControl(inheritMaxAge: true) {
        id: ID!
        title: String
        author: String
        published: DateTime
    }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    """
    Get all books in ascending order by id
    """
    books(first: Int! = 10, after: String, author: String): BookConnection

    """
    Get all books in descending order by id
    """
    books_desc(last: Int! = 10, before: String, author: String): BookConnection

    """
    Get all books by offset (page) in ascending order by sortBy field
    """
    booksByOffset(first: Int! = 10, after: String, page: Int,  author: String, sortBy: SortBy = ID): BookConnection

    """
    Get all books by offset (page) in descendenting order by sortBy field
    """
    booksByOffset_desc(last: Int! = 10, before: String, page: Int,  author: String, sortBy: SortBy = ID): BookConnection
  }
  enum SortBy {
    ID
    TITLE
    AUTHOR
    PUBLISHED
  }
`;

export default schema;

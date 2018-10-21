const { serialize, deserialize } = require('../db/githubGistDriver');

describe('githubDriver', () => {
  const testData = [
    [
      {
        articles: [],
        likes: [],
        comments: [],
      },
      {},
    ],
    [
      {
        articles: [{ __id: '1539191973461.9456' }],
        likes: [
          {
            __id: '1539191973461.992',
          },
        ],
        comments: [
          {
            __id: '1539191973461.416',
          },
        ],
      },
      {
        'articles::1539191973461.9456': {
          content: JSON.stringify({
            __id: '1539191973461.9456',
          }),
        },
        'likes::1539191973461.992': {
          content: JSON.stringify({
            __id: '1539191973461.992',
          }),
        },
        'comments::1539191973461.416': {
          content: JSON.stringify({
            __id: '1539191973461.416',
          }),
        },
      },
    ],
    [
      {
        articles: [{ __id: '1539191973461.9456' }],
        likes: [
          {
            __id: '1539191973461.992',
          },
          {
            __id: '1539691973461.992',
          },
        ],
        comments: [],
      },
      {
        'articles::1539191973461.9456': {
          content: JSON.stringify({
            __id: '1539191973461.9456',
          }),
        },
        'likes::1539191973461.992': {
          content: JSON.stringify({
            __id: '1539191973461.992',
          }),
        },
        'likes::1539691973461.992': {
          content: JSON.stringify({
            __id: '1539691973461.992',
          }),
        },
      },
    ],
  ];
  describe('serializer', () => {
    testData.forEach(([input, expectedResult]) => {
      it('successfully serializes data for gist', () => {
        expect(serialize(input)).toMatchObject(expectedResult);
      });
    });
  });
  describe('deserializer', () => {
    testData.forEach(([expectedResult, input]) => {
      it('successfully deserializes data for gist', () => {
        expect(deserialize(input)).toMatchObject(expectedResult);
      });
    });
  });
});

/* eslint-disable no-undef */
'use strict';

const request = require('supertest');
const app = require('./app');

describe('Test DurhaMitra service', () => {
    test('GET /posts succeeds', () => {
        return request(app)
        .get('/posts')
        .expect(200);
    });

    test('GET /posts returns JSON', () => {
        return request(app)
        .get('/posts')
        .expect('Content-type', /json/);
    });

    test('GET /posts with index succeeds', () => {
        return request(app)
        .get('/posts/?index=0')
        .expect(200);
    });

    test('GET /posts with index returns JSON', () => {
        return request(app)
        .get('/posts/?index=0')
        .expect('Content-type', /json/);
    });

    test('GET /comments succeeds', () => {
        return request(app)
        .get('/comments')
        .expect(200);
    });

    test('GET /comments returns JSON', () => {
        return request(app)
        .get('/comments')
        .expect('Content-type', /json/);
    });

    test('GET /comments with index succeeds', () => {
        return request(app)
        .get('/comments/?index=0')
        .expect(200);
    });

    test('GET /comments with index returns JSON', () => {
        return request(app)
        .get('/comments/?index=0')
        .expect('Content-type', /json/);
    });

    test('GET /search with query succeeds', () => {
        return request(app)
        .get('/search/?search=abc')
        .expect(200);
    });

    test('GET /search with query returns JSON', () => {
        return request(app)
        .get('/search/?search=a')
        .expect('Content-type', /json/);
    });

    test('POST /posts/new', () => {
        const params = { name: 'Calvin', college: 'collingwood', text: 'test', date: '13/01/2023 06:06:27', likes: 0, images: [] };
        return request(app)
        .post('/posts/new')
        .send(params)
        .expect(200);
    });

    test('POST /comments/new', () => {
        const params = { name: 'Calvin', college: 'collingwood', text: 'test' };
        return request(app)
        .post('/comments/new/?index=0')
        .send(params)
        .expect(200);
    });

    test('POST /likes', () => {
        return request(app)
        .post('/likes/?likes=1&index=0')
        .expect(200);
    });
});

import configureStorage from './configureStorage';
import createLoggerMiddleware from 'redux-logger';
import * as actionTypes from '../ActionTypes';

// let firebaseDeps = null;

// Like redux-thunk but with dependency injection.
const injectMiddleware = deps => ({ dispatch, getState }) => next => action =>
  next(typeof action === 'function'
    ? action({ ...deps, dispatch, getState })
    : action
  );

// Like redux-promise-middleware but sane.
const promiseMiddleware = options => ({ dispatch }) => next => action => {
  const { shouldThrow } = options || {};
  const { payload } = action;
  const payloadIsPromise = payload && typeof payload.then === 'function';
  if (!payloadIsPromise) return next(action);
  const createAction = (suffix, payload) => ({ type: `${action.type}_${suffix}`, meta: { action }, payload });
  // Note we don't return promise, because martinfowler.com/bliki/CQRS.html
  payload
    .then(value => dispatch(createAction('SUCCESS', value)))
    .catch(error => {
      dispatch(createAction('ERROR', error));
      // Not all errors need to be reported.
      if (shouldThrow(error)) {
        throw error;
      }
    });
  return next(createAction('START'));
};

export default function configureMiddleware(initialState, platformDeps, platformMiddleware) {
  const {
    STORAGE_SAVE,
    storageEngine,
    storageMiddleware,
  } = configureStorage(initialState, platformDeps.createStorageEngine);

  const middleware = [
    injectMiddleware({
      ...platformDeps,
      // ...firebaseDeps,
      now: () => Date.now(),
      storageEngine,
    }),
    promiseMiddleware({
      shouldThrow: error => error === undefined,
    }),
    ...platformMiddleware,
  ];

  if (storageMiddleware) {
    middleware.push(storageMiddleware);
  }

  const enableLogger = process.env.NODE_ENV !== 'production' && process.env.IS_BROWSER;

  // Logger must be the last middleware in chain.
  if (enableLogger) {
    const ignoredActions = [
      STORAGE_SAVE,
      actionTypes.CHANGE_CURRENT_TIME,
      actionTypes.SWITCH_NEED_CHANGE_TIME,
      actionTypes.CHANGE_DURATION,
      actionTypes.SWITCH_NEED_CHANGE_VOLUME,
    ];
    const logger = createLoggerMiddleware({
      collapsed: true,
      predicate: (getState, action) => ignoredActions.indexOf(action.type) === -1,
      // Convert immutable to JSON.
      stateTransformer: state => JSON.parse(JSON.stringify(state)),
    });
    middleware.push(logger);
  }

  return middleware;
}
import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  accountInfoRequest: null,
  accountInfoSuccess: ['data'],
  accountInfoFailure: ['error'],
  clearData: null
})

export const AccountInfoTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  data: [],
  error: null,
  fetching: false
})

/* ------------- Reducers ------------- */

export const accountInfoRequest = state => state.merge({ fetching: true, error: null })

export const accountInfoSuccess = (state, { data }) => state.merge({ fetching: false, error: null, data })

export const accountInfoFailure = (state, { error }) => state.merge({ fetching: false, error, data: null })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ACCOUNT_INFO_REQUEST]: accountInfoRequest,
  [Types.ACCOUNT_INFO_SUCCESS]: accountInfoSuccess,
  [Types.ACCOUNT_INFO_FAILURE]: accountInfoFailure
})

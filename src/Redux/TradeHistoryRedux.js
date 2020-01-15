
import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  tradeHistoryRequest: ['params'],
  tradeHistorySuccess: ['data'],
  tradeHistoryFailure: ['error'],
  clearData: null
})

export const TradeHistoryTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  data: [],
  error: null,
  fetching: false
})

/* ------------- Reducers ------------- */

export const tradeHistoryRequest = state => state.merge({ fetching: true, error: null })

export const tradeHistorySuccess = (state, { data }) => state.merge({ fetching: false, error: null, data })

export const tradeHistoryFailure = (state, { error }) => state.merge({ fetching: false, error, data: null })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.TRADE_HISTORY_REQUEST]: tradeHistoryRequest,
  [Types.TRADE_HISTORY_SUCCESS]: tradeHistorySuccess,
  [Types.TRADE_HISTORY_FAILURE]: tradeHistoryFailure
})

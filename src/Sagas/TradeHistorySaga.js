import { call, put } from 'redux-saga/effects'
import TradeHistoryActions from '../Redux/TradeHistoryRedux'

export function * tradeHistory (api, {params}) {
  try {
    const res = yield call(api, params)
    if (res.success) {
      yield put(TradeHistoryActions.tradeHistorySuccess(res.data))
    } else {
      yield put(TradeHistoryActions.tradeHistoryFailure(res.error))
    }
  } catch (error) {
    yield put(TradeHistoryActions.tradeHistoryFailure(error.message))
  }
}

import { call, put } from 'redux-saga/effects'
import ApiSettingActions from '../Redux/ApiSettingRedux'

export function * apiSetting (api, {params}) {
  try {
    const res = yield call(api, params)
    if (res.success) { yield put(ApiSettingActions.apiSettingSuccess(res.data)) } else yield put(ApiSettingActions.apiSettingFailure(res.error))
  } catch (error) {
    yield put(ApiSettingActions.apiSettingFailure(error.message))
  }
}

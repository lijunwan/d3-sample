import {observable, action} from 'mobx';
class NetworkStore {
  @observable isLoading = false;
  @action.bound toggleLoading () {
    this.isLoading = !isLoading;
  }
}
export default new NetworkStore();
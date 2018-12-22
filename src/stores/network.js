import {observable, action} from 'mobx';
import axios from 'axios';
class NetworkStore {
  @observable isLoading = true;
  @observable nodesData = [];
  @observable edgesData = [];
  @observable network = {};
  @action.bound toggleLoading () {
    this.isLoading = !this.isLoading;
  }
  @action.bound getNetwork() {
    console.log('get network');
    this.isLoading = true;
    axios.get('/network/expand/init?companyName=深创新投资管理顾问（北京）有限公司')
    .then(action('===', (resp)=>{
      this.network = resp.data;
      if (resp.data.currentNetwork) {
          this.nodesData = resp.data.currentNetwork.nodes;
          this.edgesData = resp.data.currentNetwork.links;
      }
      this.isLoading = false;
  }))
    .catch((error)=>{
      this.isLoading = false;
        console.log('---', error);
    })
  }
}
export default new NetworkStore();
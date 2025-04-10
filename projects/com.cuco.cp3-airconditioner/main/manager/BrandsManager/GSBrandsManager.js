/*
 * @Author: huayou.fu 
 * @Created date: 2021-11-22 17:14:35 
 */
import { Service } from "miot";
class IGSBrandsManager {

  /**
     *获取小米红外线空调控制器支持的品牌
     */
  async xmSupportBrands(category):Promise {
    let promise = new Promise((resolve, reject) => {
      Service.ircontroller.getBrands({ category: category }).then((res) => {
        resolve(res);
      }
      ).catch((err) => {
        reject(err);
      });
    }
    );
    return promise;
  }
}

export const GSBrandsManager = new IGSBrandsManager();
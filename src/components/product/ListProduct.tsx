import React, { useEffect, useState } from "react";
import axios from "axios";
import FrameActionButton from "../common/FrameActionButton.js";

const PROCESSOR_SERVER = process.env.REACT_APP_PROCESSOR_API;

export default function ListProduct() {
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    axios.get(`${PROCESSOR_SERVER}/publications/list`).then(function (response) {

      setProductList(response.data);
      
    }).catch(function (error) {

    });
  }, []);

  let productListDisplay = <span />;
  if (productList.length > 0) {
    console.log(productList);

    productListDisplay = productList.map((product, index) => {
      return (
        <div key={index} className="p-4 bg-slate-50 border-2 border-slate-300">
            <img src={`https://cloudflare-ipfs.com/ipfs/${product.imageHash}`} className=""/>
            <div className="grid grid-cols-3 gap-1">
              <FrameActionButton>
                Mint
              </FrameActionButton>
              <FrameActionButton>
                Burn
              </FrameActionButton>
              <FrameActionButton>
                Info
              </FrameActionButton>
            </div>
        </div>
      );
    });
  }
  return (
    <div className="overflow-y-scroll h-auto">
      <div className="m-auto text-lg font-bold mt-4 mb-4">Latest</div>
      <div className="grid grid-cols-3 gap-2">
        {productListDisplay}
      </div>
    </div>
  );
}
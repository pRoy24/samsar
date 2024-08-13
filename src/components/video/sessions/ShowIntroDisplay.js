import React, { useEffect, useState } from 'react';

export default function ShowIntroDisplay() {
  const [ introSessionList, setIntroSessionList ] = useState([]);
  useEffect(() => {
    axios.get(`${API_SERVER}/video_sessions/intro_sessions`, headers).then(function (dataRes) {

      const introSessionList = dataRes.data;
      if (introSessionList.length > 0) {
        setIntroSessionList(introSessionList);
      }

    });
  })
  return (
    <div>

    </div>
  )
}
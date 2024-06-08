import React, { useEffect , useState } from 'react';
import axios from 'axios';
import { getHeaders } from '../../utils/web';
import { useNavigate } from 'react-router-dom';

const API_SERVER = process.env.REACT_APP_PROCESSOR_API;
const IPFS_BASE = process.env.REACT_APP_IPFS_BASE;

export default function UserPublications() {
  const [ publicationList, setPublicationList ] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const headers = getHeaders();

    axios.get(`${API_SERVER}/publications/list_user_publications`, headers).then((res) => {
      const data = res.data;
      setPublicationList(data);

    }).catch((err) => {

    });

  }, []);

  const gotoPublicationPage = (tokenId) => {
    console.log(tokenId);
    return () => navigate(`/publication/${tokenId}`);
  }

  return (
    <div>
      <h1>User Publications</h1>
      <div className='grid grid-cols-3 gap-4'>
      {
        publicationList.map((publication, index) => {
          return (
            <div key={index} className='w-[512px] inline-flex' onClick={gotoPublicationPage(publication.tokenId)}>
             <img src={`${IPFS_BASE}${publication.imageHash}`} className='w-[512px]'/>
             <div>
              {publication.tokenId}
              </div>
            </div>
          )
        })
      }
      </div>
    </div>
  )
}
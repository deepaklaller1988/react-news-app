import React, { useEffect, useState } from 'react';
import './home.css'
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import Spinner from 'react-bootstrap/Spinner';

import "react-datepicker/dist/react-datepicker.css";

let baseUrl = `https://df45-112-196-51-235.ngrok-free.app`;
let newsApiKey = "2316c55266114746a2ffd15b9237082f";

function Home() {
    const [data,setData] = useState([]);
    const [pageCount,setPageCount] = useState(0);
    const [currentPage,setCurrentPage] = useState(1);
    const [topNews,setTopNews] = useState([]);
    const [accessToken,setAccessToken] = useState([]);
    const [showPopup,setShowPopup] = useState(false);
    const [checkedPreferences, setCheckedPreferences] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [selectedDataSource, setSelectedDataSource] = useState('NewsAPI.ai');
    const [selectedSource, setSelectedSource] = useState();
    const [search, setSearch] = useState('')
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isLoading,setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(()=>{
        let token = JSON.parse(localStorage.getItem("token"));
        if(token){
            setAccessToken(token);
            getPreferences(token);
            // getSources();
        }else{
            navigate("/");
        }
    }, [])


    useEffect(()=>{
        fetchData();
    },[currentPage, search])

    useEffect(()=>{
        if(selectedCategories.length > 0){
            markChecked();
            getSources();
        }
    },[selectedCategories])

    useEffect(() =>{
        if(showPopup && selectedSource !== ''){
            markChecked();
        }
    },[showPopup])

    const getPreferences = async (token) =>{
        const user = JSON.parse(localStorage.getItem("user"));
        const headers = {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`,
          };
  
        const {data:res} = await axios.post(baseUrl + `/api/users/${user.id}/preferences`,{},{headers});
        const {data:source} = await axios.post(baseUrl + `/api/users/${user.id}/settings`,{},{headers});

        if(res.success && source.success){
            if(res.data.length === 0 && !source.data){
                setShowPopup(true);
            }else{
                if(JSON.parse(res.data[0].data).length === 0){
                    setShowPopup(true);
                }
                setIsLoading(false);
                setCheckedPreferences(JSON.parse(res.data[0].data));
                setSelectedCategories(JSON.parse(res.data[0].data));
                setSelectedDataSource(source.data.datasource);
            }
        }
    }

    const fetchData = async () =>{
        const startdate = startDate !== '' ? formattedDate(startDate) : '';
        const enddate = endDate !== '' ? formattedDate(endDate) : "";

        if(selectedDataSource === 'NewsAPI.org'){
        const headlines = await axios.get(`https://newsapi.org/v2/top-headlines?category=${selectedCategories.join(",")}&page=1&pageSize=10&apiKey=${newsApiKey}`);
        if(headlines.status === 200){
            setTopNews(headlines.data.articles.slice(0,3))
        }
        
        const res = await axios.get(`https://newsapi.org/v2/everything?q=${search}&sources=${selectedSource ? selectedSource : "abc-news"}&from=${startdate}&to=${enddate}&page=${currentPage}&pageSize=10&apiKey=${newsApiKey}`)
        if(res.status === 200){
            setData(res.data.articles)
            if( res.data.totalResults >= 100){
                setPageCount(Math.ceil(100/10))
            }else{
                setPageCount(Math.ceil(res.data.totalResults/10))
            } 
        }
        }

        if(selectedDataSource === 'NewsAPI.ai'){
            const categoryUri = await getCategoryUri(selectedCategories);
            // const sourceUri = selectedSource ? await getSourceUri(selectedSource) : null;
            // const sourceUri =  await getSourceUri("bbc")

        let requestBody = {
            "action": "getArticles",
            "categoryUri": categoryUri,
            "articlesPage": 1,
            "articlesCount": 100,
            "articlesSortBy": "date",
            "articlesSortByAsc": false,
            "articlesArticleBodyLen": -1,
            "resultType": "articles",
            "lang":"eng",
            "dataType": [
              "news",
              "pr"
            ],
            "apiKey": "619449db-6249-45ff-992e-d9d8284a92c3",
            "forceMaxDataTimeWindow": 31
          }

          if(selectedSource !== ''){
            requestBody.sourceUri = selectedSource
          }

          if(search !== ''){
            requestBody.keyword = search
          }

          if(startdate !== ''){
            requestBody.dateStart = startdate
          }

          if(enddate !== ''){
            requestBody.dateEnd = enddate
          }
        
        const res = await axios.post(`http://eventregistry.org/api/v1/article/getArticles`,requestBody)
          console.log(res)
        if(res.status === 200){
            if(res.data.articles){ 
                setData(res.data.articles.results)
                setTopNews(res.data.articles.results.slice(0,3))
            if( res.data.articles.totalResults >= 100){
                setPageCount(Math.ceil(100/10))
            }else{
                setPageCount(Math.ceil(res.data.totalResults/10))
            } }
        }
        }

        if(selectedDataSource === 'NY Times'){
            const arr1 = ['Business', 'Sports'];
            const arr = arr1.map((val)=>{
                if(val === 'Entertainment'){
                    return 'Movies'
                }else if(val === 'General'){
                    return 'Favorites'
                }else{
                    return val
                }
            })
            const baseUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
            const params = {
                fq: "section_name:Business",
                fq: arr.map((category) => `news_desk:("${category}")`).join(' OR '),
                // sort: 'newest',
                "api-key": "AL5jWbBj302O6hoBEoswtihKPBEG37Te",
            };

  try {
    const res = await axios.get(baseUrl, { params });
    console.log(res)
    if(res.status === 200){
        if(res.data.response.docs){ 
            setData(res.data.response.docs)
            setTopNews(res.data.response.docs.slice(0,3))
        if( res.data.response.docs.length >= 100){
            setPageCount(Math.ceil(100/10))
        }else{
            setPageCount(Math.ceil(res.data.totalResults/10))
        } }
    }
    // setArticles(response.data.response.docs);
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
        }

    }

    const filterCategory = () =>{
        const categories = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(checkbox => checkbox.nextSibling.textContent.trim());
        setSelectedCategories(categories);
    }

    const formattedDate = (date) =>{
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formatDate = `${year}-${month}-${day}`;

        return formatDate;
    }

    const getCategoryUri = async (categoryArr) =>{
        const arr = ['Business', 'Entertainment'];
        const catergoryUri = [];
        try{
            await Promise.all(
                categoryArr.map(async (val) =>{
                let uri = await axios.post("http://eventregistry.org/api/v1/suggestCategoriesFast",{
                "apiKey": "619449db-6249-45ff-992e-d9d8284a92c3",
                "prefix": val,
                "page": 1,
                "count": 20,
                "articleBodyLen": -1
              });
              if(uri.data){
                catergoryUri.push(uri.data[0].uri)
              }
              console.log(uri)
            })
            );
            return catergoryUri;
        }catch(error){
            console.log(error)
        }  
    }

    const getSourceUri = async (source) =>{
        try{
                let uri = await axios.post("http://eventregistry.org/api/v1/suggestSourcesFast",{
                "apiKey": "619449db-6249-45ff-992e-d9d8284a92c3",
                "prefix": source,
                "page": 1,
                "count": 20,
                "articleBodyLen": -1
              });
              if(uri.data){
                console.log(uri)
                return uri.data[0].uri;
              }
        }catch(error){
            console.log(error)
        }  
    }

    const getSources = async () =>{
        const arr = ['Business', 'Entertainment'];
        let sourceArr = [];
        if(selectedDataSource === 'NewsAPI.org'){
        await Promise.all(
            selectedCategories.map(async (item) => {
              const res = await axios.get(`https://newsapi.org/v2/top-headlines/sources?category=${item}&apiKey=${newsApiKey}`);
              if (res.status === 200) {
                if (res.data.sources.length > 0) {
                  res.data.sources.map((item) => {
                    sourceArr.push({ name: item.name, id: item.id });
                  });
                }
              }
            })
          );
        }
        if(selectedDataSource === 'NewsAPI.ai'){
            const res = await axios.post(`http://eventregistry.org/api/v1/suggestSourcesFast`,{
                "apiKey": "619449db-6249-45ff-992e-d9d8284a92c3",
                "prefix": ""
              });
              console.log(res)
              if (res.status === 200) {
                if (res.data.length > 0) {
                  res.data.map((item) => {
                    sourceArr.push({ name: item.title, id: item.uri });
                  });
                }
              }
        }
        if(sourceArr.length > 0) {
            setSelectedSource(sourceArr[0].id);
        setSources([...sourceArr]);
    }
    }

    const logout = async () =>{
        let token = JSON.parse(localStorage.getItem("token"));
        const user = JSON.parse(localStorage.getItem("user"));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          };
  
        const url = baseUrl + `/api/logout`;
        // const res = await axios.post(url, {}, {
        //     headers
        // });
        console.log( url)
    }

    const saveSettings = async () =>{
        const categories = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(checkbox => checkbox.nextSibling.textContent.trim());
    
        const dataSource = document.querySelector('input[name="dataSource"]:checked') ? document.querySelector('input[name="dataSource"]:checked').nextSibling.textContent.trim() : null;

        const baseUrl = `https://df45-112-196-51-235.ngrok-free.app`;
        let token = JSON.parse(localStorage.getItem("token"));
        const user = JSON.parse(localStorage.getItem("user"));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          };
        if(categories.length>0 && dataSource){
        const {data: preference} = await axios.post(baseUrl + '/api/users/preferences', {
            data: categories,
            user_id: user.id
        }, {headers})
        const {data: source} = await axios.post(baseUrl + '/api/users/settings', {
                "datasource":dataSource,
                "datasource_id":"news_app",
                "user_id" :user.id       
        }, {headers})
        if(preference.success && source.success){
            setShowPopup(false);
            setSelectedDataSource(dataSource);
            setSelectedCategories(categories)
            setCheckedPreferences(categories);
        }
     }else{
        alert("Please select atleast one Category and Data Source")
     }
    }

    const markChecked = () =>{
        selectedCategories.forEach(category => {
            const checkbox = document.querySelector(`input[name="categories"][value="${category}"]`);
            const prefered = document.querySelector(`input[name="preferences"][value="${category}"]`);

            if (checkbox) {
              checkbox.checked = true;
            }
            if (prefered) {
                prefered.checked = true;
              }
          });
          if(showPopup && selectedDataSource !== ''){
            const datasource = document.querySelector(`input[name="dataSource"][value="${selectedDataSource}"]`);
            if(datasource){
                datasource.checked = true;
            }
          }
    }

  if(isLoading){
    return (<div className='preferences'>Loading{" "}<Spinner animation="border" variant="primary" /></div>)
  }else{
  return (
    <div>
      <div id="wrapper">
        <header className="tech-header">
            <section className='container'>
                <span><a href="">News App</a></span><nav><a href="">Home</a><a onClick={()=>{setShowPopup(true)}}>Settings</a><a onClick={logout}>Logout</a></nav>
            </section>
        </header>

        <section className="section first-section">
            <div className="container-fluid">
                <div className="masonry-blog clearfix">
                    {topNews && topNews.length > 0 &&
                        topNews.map((item,index) =>{
                            return(
                                <div 
                                className={`${index ===0 ? "first-slot" 
                                                         : index ===1 ? "second-slot" 
                                                                      : "last-slot"}`}>
                        <div className="masonry-box post-media">
                             <img src={
                                                    selectedDataSource ===
                                                    "NewsAPI.org"
                                                      ? item.urlToImage
                                                      : selectedDataSource ===
                                                        "NY Times"
                                                      ? item.multimedia.length >
                                                        0
                                                        ? "https://www.nytimes.com/" + item.multimedia[0].url
                                                        : ""
                                                      : item.image
                                                  } alt="top news" className="img-fluid" />
                             <div className="shadoweffect">
                                <div className="shadow-desc">
                                    <div className="blog-meta">
                                        <span className="bg-orange"><a title="">{selectedDataSource ===
                                                "NewsAPI.org"
                                                  ? item.source.name
                                                  : selectedDataSource ===
                                                  "NY Times" ? item.source :item.source.title}</a></span>
                                        <h4><a href={selectedDataSource ===
                                                        "NY Times" ? item.web_url :item.url} title="">{selectedDataSource ===
                                                            "NY Times" ? item.headline.main : item.title.slice(0, 100)}</a></h4>
                                        <small>{selectedDataSource ===
                                              "NewsAPI.org"
                                                ? item.publishedAt.slice(0, 10)
                                                : selectedDataSource ===
                                                "NY Times" ? item.pub_date.slice(0, 10) :item.dateTimePub.slice(0, 10)}</small>
                                     {selectedDataSource ===
                                            "NewsAPI.org" ? (
                                              <small>by {item.author}</small>
                                            ) : selectedDataSource ===
                                            "NY Times" ? item.byline.original : item.authors.length > 0 ? (
                                              <small>
                                                by {item.authors[0].name}
                                              </small>
                                            ) : (
                                              ""
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                            )
                        })
                    }
                     {/* <div className="first-slot">
                        <div className="masonry-box post-media">
                             <img src="upload/tech_01.jpg" alt="" className="img-fluid" />
                             <div className="shadoweffect">
                                <div className="shadow-desc">
                                    <div className="blog-meta">
                                        <span className="bg-orange"><a href="tech-category-01.html" title="">Technology</a></span>
                                        <h4><a href="tech-single.html" title="">Say hello to real handmade office furniture! Clean & beautiful design</a></h4>
                                        <small><a href="tech-single.html" title="">24 July, 2017</a></small>
                                        <small><a href="tech-author.html" title="">by Amanda</a></small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                </div>
                
            </div>
        </section>

        <section className="section">
            <div className="container">
                <div className="row">
                <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12">
                    <div className='sidebarFilter'>
                        <section>
                        <h6>Search</h6>
                            <input type="text" placeholder="Search Here" value={search} onChange={(e) => {setSearch(e.target.value)}} />
                        </section>
                        <section>
                            <h6>Category</h6>
                            <label><input type='checkbox' name='categories' value="Bussiness" onChange={filterCategory} /> Bussiness</label>
                            <label><input type='checkbox' name='categories' value="Entertainment" onChange={filterCategory} /> Entertainment</label>
                            <label><input type='checkbox' name='categories' value="General" onChange={filterCategory} /> General</label>
                            <label><input type='checkbox' name='categories' value="Health" onChange={filterCategory} /> Health</label>
                            <label><input type='checkbox' name='categories' value="Science" onChange={filterCategory} /> Science</label>
                            <label><input type='checkbox' name='categories' value="Sports" onChange={filterCategory} /> Sports</label>
                            <label><input type='checkbox' name='categories' value="Technology" onChange={filterCategory} /> Technology</label>
                        </section>
                        <section>
                            <label>Source</label>
                            <select value={selectedSource} onChange={(e)=>{setSelectedSource(e.target.value)}}>
                            {
                                sources && sources.map((item)=>{
                                    return(
                                        <option value={item.id}>{item.name}</option>
                                    )
                                })
                            } 
                            </select>
                        </section>
                        {/* <section>
                            <label>Authors</label>
                            <select>
                                <option>Sam</option>
                                <option>Anderson</option>
                                <option>Quito</option>
                            </select>
                        </section> */}
                        <section>
                            <label>Date</label>
                            <DatePicker placeholderText="From" dateFormat="yyyy/MM/dd" selected={startDate} onChange={(date) => setStartDate(date)} />
                            <DatePicker placeholderText="To" dateFormat="yyyy/MM/dd" selected={endDate} onChange={(date) => setEndDate(date)} />
                            </section>

                        <section><button onClick={fetchData}>Filter</button></section>
                    </div>

                        <div className="sidebar">
                            <div className="widget">
                                <h2 className="widget-title">Popular News</h2>
                                <div className="trend-videos">
                                    <div className="blog-box">
                                        <div className="post-media">
                                            <a href="tech-single.html" title="">
                                                <img src="upload/tech_video_01.jpg" alt="" className="img-fluid" />
                                                <div className="hovereffect">
                                                    <span className="videohover"></span>
                                                </div>
                                            </a>
                                        </div>
                                        <div className="blog-meta">
                                            <h4><a href="tech-single.html" title="">We prepared the best 10 laptop presentations for you</a></h4>
                                        </div>
                                    </div>

                                    <hr className="invis" />

                                    <div className="blog-box">
                                        <div className="post-media">
                                            <a href="tech-single.html" title="">
                                                <img src="upload/tech_video_02.jpg" alt="" className="img-fluid" />
                                                <div className="hovereffect">
                                                    <span className="videohover"></span>
                                                </div>
                                            </a>
                                        </div>
                                        <div className="blog-meta">
                                            <h4><a href="tech-single.html" title="">We are guests of ABC Design Studio - Vlog</a></h4>
                                        </div>
                                    </div>

                                    <hr className="invis" />

                                    <div className="blog-box">
                                        <div className="post-media">
                                            <a href="tech-single.html" title="">
                                                <img src="upload/tech_video_03.jpg" alt="" className="img-fluid" />
                                                <div className="hovereffect">
                                                    <span className="videohover"></span>
                                                </div>
                                            </a>
                                        </div>
                                        <div className="blog-meta">
                                            <h4><a href="tech-single.html" title="">Both blood pressure monitor and intelligent clock</a></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="widget">
                                <h2 className="widget-title">Follow Us</h2>

                                <div className="row text-center">
                                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                        <a href="#" className="social-button facebook-button">
                                            <i className="fa fa-facebook"></i>
                                            <p>27k</p>
                                        </a>
                                    </div>

                                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                        <a href="#" className="social-button twitter-button">
                                            <i className="fa fa-twitter"></i>
                                            <p>98k</p>
                                        </a>
                                    </div>

                                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                        <a href="#" className="social-button google-button">
                                            <i className="fa fa-google-plus"></i>
                                            <p>17k</p>
                                        </a>
                                    </div>

                                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6">
                                        <a href="#" className="social-button youtube-button">
                                            <i className="fa fa-youtube"></i>
                                            <p>22k</p>
                                        </a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="col-lg-9 col-md-12 col-sm-12 col-xs-12">
                        <div className="page-wrapper">
                            <div className="blog-top clearfix">
                                <h4 className="pull-left">Recent News <a href="#"><i className="fa fa-rss"></i></a></h4>
                            </div>
                            <div className="blog-list clearfix">
                                {data && data.length > 0 ? data.map((item, index) =>{
                                    return (
                                      <div key={index}>
                                        <div className="blog-box row">
                                          <div className="col-md-4">
                                            <div className="post-media">
                                              <a
                                                href="tech-single.html"
                                                title=""
                                              >
                                                <img
                                                  src={
                                                    selectedDataSource ===
                                                    "NewsAPI.org"
                                                      ? item.urlToImage
                                                      : selectedDataSource ===
                                                        "NY Times"
                                                      ? item.multimedia.length >
                                                        0
                                                        ? "https://www.nytimes.com/" + item.multimedia[0].url
                                                        : ""
                                                      : item.image
                                                  }
                                                  alt="image"
                                                  className="img-fluid"
                                                />
                                                <div className="hovereffect"></div>
                                              </a>
                                            </div>
                                          </div>

                                          <div className="blog-meta big-meta col-md-8">
                                            <h4>
                                              <a href={selectedDataSource ===
                                                        "NY Times" ? item.web_url :item.url} title="">
                                                {selectedDataSource ===
                                                        "NY Times" ? item.headline.main : item.title.slice(0, 100)}
                                              </a>
                                            </h4>
                                            <p>
                                              {selectedDataSource ===
                                              "NewsAPI.org"
                                                ? item.description
                                                : selectedDataSource ===
                                                "NY Times" ? item.abstract.slice(0, 150) : item.body.slice(0, 150)}
                                            </p>
                                            <small className="firstsmall">
                                              <a className="bg-orange">
                                                {selectedDataSource ===
                                                "NewsAPI.org"
                                                  ? item.source.name
                                                  : selectedDataSource ===
                                                  "NY Times" ? item.source :item.source.title}
                                              </a>
                                            </small>
                                            <small>
                                              {selectedDataSource ===
                                              "NewsAPI.org"
                                                ? item.publishedAt.slice(0, 10)
                                                : selectedDataSource ===
                                                "NY Times" ? item.pub_date.slice(0, 10) :item.dateTimePub.slice(0, 10)}
                                            </small>
                                            {selectedDataSource ===
                                            "NewsAPI.org" ? (
                                              <small>by {item.author}</small>
                                            ) : selectedDataSource ===
                                            "NY Times" ? item.byline.original : item.authors.length > 0 ? (
                                              <small>
                                                by {item.authors[0].name}
                                              </small>
                                            ) : (
                                              ""
                                            )}
                                          </div>
                                        </div>
                                        <hr className="invis" />
                                      </div>
                                    );
                                }) : (
                                    <>
                                <div className="blog-box row">
                                    No Data
                                    {/* <div className="col-md-4">
                                        <div className="post-media">
                                            <a href="tech-single.html" title="">
                                                <img src="upload/tech_blog_01.jpg" alt="" className="img-fluid" />
                                                <div className="hovereffect"></div>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="blog-meta big-meta col-md-8">
                                        <h4><a href="" title="">Top 10 phone applications and 2017 mobile design awards</a></h4>
                                        <p>Aenean interdum arcu blandit, vehicula magna non, placerat elit. Mauris et pharetratortor. Suspendissea sodales urna. In at augue elit. Vivamus enim nibh, maximus ac felis nec, maximus tempor odio.</p>
                                        <small className="firstsmall"><a className="bg-orange" href="tech-category-01.html" title="">Name</a></small>
                                        <small>XX-XX-XXXX</small>
                                        <small>by XYZ</small>
                                    </div> */}
                                </div>
                                <hr className="invis" />
                                </>
                                )}
                            </div>
                        </div>

                        <hr className="invis" />

                        <div className="row">
                            <div className="col-md-12">
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-start">
                                        <li className="page-item" onClick={()=>{ setCurrentPage(1)}}><a className="page-link">1</a></li>
                                        <li className="page-item" onClick={()=>{ setCurrentPage(2)}}><a className="page-link">2</a></li>
                                        <li className="page-item" onClick={()=>{ setCurrentPage(3)}}><a className="page-link">3</a></li>
                                        <li className="page-item" onClick={()=>{ setCurrentPage(currentPage+1)}}>
                                            <a className="page-link">Next</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
        {showPopup && 
        <div className='preferences'>
            <section>
            <h4>{selectedCategories.length > 0 ? "Change" : "Select" } Your Preferences</h4>

                <h5>{selectedCategories.length > 0 ? "Change" : "Select" } Your Categories</h5>
                <div className='allDetail'>
                    <label><input type='checkbox' name='preferences' value="Bussiness" /> Bussiness</label>
                    <label><input type='checkbox' name='preferences' value="Entertainment" /> Entertainment</label>
                    <label><input type='checkbox' name='preferences' value="General" /> General</label>
                    <label><input type='checkbox' name='preferences' value="Health" /> Health</label>
                    <label><input type='checkbox' name='preferences' value="Science" /> Science</label>
                    <label><input type='checkbox' name='preferences' value="Sports" /> Sports</label>
                    <label><input type='checkbox' name='preferences' value="Technology" /> Technology</label>
                    </div>
                    <h5>{selectedCategories.length > 0 ? "Change" : "Select" } Your News Data API</h5>
                    <div className='selectRadio allDetail'>
                    <label><input type='radio' id='dataSource-1'  name='dataSource' value="NewsAPI.org"/> NewsAPI.org</label>  
                    <label><input type='radio' id='dataSource-2'  name='dataSource' value="NewsAPI.ai"/> NewsAPI.ai</label>  
                    <label><input type='radio' id='dataSource-3'  name='dataSource' value="NY Times"/> NY Times</label>  
                    </div>
                    <button onClick={saveSettings}>Save</button>
                    {selectedCategories.length > 0 && <button className='closePop' onClick={()=>{setShowPopup(false)}}>Cancel</button>}
            </section>
        </div>}
        <div className="dmtop">Scroll to Top</div>
    </div>
    </div>
  )
}
}

export default Home;

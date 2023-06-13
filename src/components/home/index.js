import React, { useEffect, useState } from 'react';
import './home.css'
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";

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
    const [selectedDataSource, setSelectedDataSource] = useState('');
    const [selectedSource, setSelectedSource] = useState();
    const [search, setSearch] = useState('')


    const navigate = useNavigate();

    useEffect(()=>{
        let token = JSON.parse(localStorage.getItem("token"));
        if(token){
            setAccessToken(token);
            getPreferences(token);
            getSources();

        }else{
            navigate("/");
        }
    }, [])


    useEffect(()=>{
        fetchData();
    },[currentPage, selectedSource, search])

    useEffect(()=>{
        if(selectedCategories.length > 0){
            markChecked();
            getSources();
        }
    },[selectedCategories])

    // useEffect(() =>{

    // })

    const getPreferences = async (token) =>{
        const user = JSON.parse(localStorage.getItem("user"));
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          };
  
        console.log(user)
        const baseUrl = `https://2c03-112-196-51-235.ngrok-free.app/backend-laravel-api`;
        const url = `https://2c03-112-196-51-235.ngrok-free.app/backend-laravel-api/api/users/${user.id}/preferences`;
        const {data:res} = await axios.post(baseUrl + `/api/users/${user.id}/preferences`,{},{headers});
        const {data:source} = await axios.post(baseUrl + `/api/users/${user.id}/settings`,{},{headers});

        console.log(res, source)
        if(res.success && source.success){
            if(res.data[0].data.length === 0 && source.data.datasource !== ""){
                setShowPopup(true);
            }else{
                console.log(JSON.parse(res.data[0].data), source.data.datasource);
                setCheckedPreferences(JSON.parse(res.data[0].data));
                setSelectedCategories(JSON.parse(res.data[0].data));
                setSelectedDataSource(source.data.datasource);
            }
        }
    }

    const fetchData = async () =>{
        const headlines = await axios.get(`https://newsapi.org/v2/top-headlines?sources=abc-news&page=1&pageSize=10&apiKey=1e5458209dfa4d7abaf5a58f413292ac`);
        if(headlines.status === 200){
            setTopNews(headlines.data.articles.slice(0,3))
        }

        const source = selectedSource !== '' ? selectedSource : "abc-news"
        
        const res = await axios.get(`https://newsapi.org/v2/everything?q=${search}&sources=${selectedSource ? selectedSource : "abc-news"}&page=${currentPage}&pageSize=10&apiKey=1e5458209dfa4d7abaf5a58f413292ac`)
        if(res.status === 200){
            setData(res.data.articles)
            if( res.data.totalResults >= 100){
                setPageCount(Math.ceil(100/10))
            }else{
                setPageCount(Math.ceil(res.data.totalResults/10))
            }
            
        }
    }

    const getSources = async () =>{
        const arr = ['Bussiness', 'Entertainment'];
        arr.map(async (item) =>{
            const res = await axios.get(`https://newsapi.org/v2/top-headlines/sources?category=${item}&apiKey=1e5458209dfa4d7abaf5a58f413292ac`);
            console.log(res)  
            if(res.status === 200){
                let sourceArr = []
                if(res.data.sources.length > 0){
                    res.data.sources.map((item)=>{
                        sourceArr.push({name: item.name, id: item.id});
                    })
                }
                setSources([...sourceArr, ...sources])
            }
        })
        // const res = await axios.get(`https://newsapi.org/v2/top-headlines/sources?category=${categories}&apiKey=1e5458209dfa4d7abaf5a58f413292ac`);
        // console.log(res,categories)
    }

    const logout = async () =>{
        let token = JSON.parse(localStorage.getItem("token"));
        const user = JSON.parse(localStorage.getItem("user"));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          };
  
        const url = `https://2c03-112-196-51-235.ngrok-free.app/backend-laravel-api/api/logout`;
        const res = await axios.post(url, {}, {
            headers
        });
        console.log(res)
    }

    const saveSettings = async () =>{
        const categories = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(checkbox => checkbox.nextSibling.textContent.trim());
    
        const dataSource = document.querySelector('input[name="dataSource"]:checked').nextSibling.textContent.trim();

        const baseUrl = `https://2c03-112-196-51-235.ngrok-free.app/backend-laravel-api`;
        let token = JSON.parse(localStorage.getItem("token"));
        const user = JSON.parse(localStorage.getItem("user"));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          };

        const {data: preference} = await axios.post(baseUrl + '/api/users/preferences', {
            data: categories,
            user_id: user.id
        }, {headers})
        console.log(preference)
        const {data: source} = await axios.post(baseUrl + '/api/users/settings', {
                "datasource":dataSource,
                "datasource_id":"news_apqi",
                "user_id" :user.id
                    
        }, {headers})
        console.log(source)
        if(preference.success && source.success){
            setShowPopup(false);
            setSelectedDataSource(dataSource);
            setSelectedCategories(categories)
            setCheckedPreferences(categories);
        }
    }

    const markChecked = () =>{
        selectedCategories.forEach(category => {
            const checkbox = document.querySelector(`input[name="categories"][value="${category}"]`);
            const prefered = document.querySelector(`input[name="preferences"][value="${category}"]`);

            // console.log(checkbox, document.querySelector(`input[name="categories"]`))
            if (checkbox) {
              checkbox.checked = true;
            }
            if (prefered) {
                prefered.checked = true;
              }
          });
    }

    console.log(checkedPreferences, selectedDataSource, sources, selectedSource)

  return (
    <div>
      <div id="wrapper">
        <header className="tech-header">
            <section className='container'>
                <span><a href="">News App</a></span><nav><a href="">Home</a><a onClick={()=>{setShowPopup(true)}}>Settings</a><a href="">Logout</a></nav>
            </section>
        </header>

        <section className="section first-section">
            <div className="container-fluid">
                <div className="masonry-blog clearfix">
                    {
                        topNews.map((item,index) =>{
                            return(
                                <div 
                                className={`${index ===0 ? "first-slot" 
                                                         : index ===1 ? "second-slot" 
                                                                      : "last-slot"}`}>
                        <div className="masonry-box post-media">
                             <img src={item.urlToImage} alt="" className="img-fluid" />
                             <div className="shadoweffect">
                                <div className="shadow-desc">
                                    <div className="blog-meta">
                                        <span className="bg-orange"><a href="tech-category-01.html" title="">{item.source.name}</a></span>
                                        <h4><a href={item.url} title="">{item.title}</a></h4>
                                        <small>{item.publishedAt.slice(0,10)}</small>
                                        <small>by {item.author}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                            )
                        })
                    }
                     <div className="first-slot">
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
                    </div>

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

                            <label><input type='checkbox' name='categories' value="Bussiness" /> Bussiness</label>
                    <label><input type='checkbox' name='categories' value="Entertainment" /> Entertainment</label>
                    <label><input type='checkbox' name='categories' value="General" /> General</label>
                    <label><input type='checkbox' name='categories' value="Health" /> Health</label>
                    <label><input type='checkbox' name='categories' value="Science" /> Science</label>
                    <label><input type='checkbox' name='categories' value="Sports" /> Sports</label>
                    <label><input type='checkbox' name='categories' value="Technology" /> Technology</label>
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
                        <section>
                            <label>Authors</label>
                            <select>
                                <option>Sam</option>
                                <option>Anderson</option>
                                <option>Quito</option>
                            </select>
                        </section>
                        <section>
                            <label>Date</label>
                            <input type="text" placeholder='From'/>
                            <input type="text" placeholder='To'/>
                            </section>

                        <section><button>Filter</button></section>
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
                                {data && data.map((item, index) =>{
                                    return(
                                        <>
                                        <div className="blog-box row">
                                    <div className="col-md-4">
                                        <div className="post-media">
                                            <a href="tech-single.html" title="">
                                                <img src={item.urlToImage} alt="" className="img-fluid" />
                                                <div className="hovereffect"></div>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="blog-meta big-meta col-md-8">
                                        <h4><a href={item.url} title="">{item.title}</a></h4>
                                        <p>{item.description}</p>
                                        <small className="firstsmall"><a className="bg-orange" href="tech-category-01.html" title="">{item.source.name}</a></small>
                                        <small>{item.publishedAt.slice(0,10)}</small>
                                        <small>by {item.author}</small>
                                    </div>
                                </div>
                                <hr className="invis" />
                                </>
                                    )
                                })}
                                <div className="blog-box row">
                                    <div className="col-md-4">
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
                                        {/* <small><a href="tech-single.html" title=""><i className="fa fa-eye"></i> 1114</a></small> */}
                                    </div>
                                </div>
                                <hr className="invis" />
                            </div>
                        </div>

                        <hr className="invis" />

                        <button onClick={logout}>
                                Logout
                            </button>

                        <div className="row">
                            <div className="col-md-12">
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-start">
                                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                                        <li className="page-item" onClick={()=>{ setCurrentPage(currentPage+1)}}>
                                            <a className="page-link" href="#">Next</a>
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
                <h4>Select Your Preferences</h4>
                <div className='allDetail'>
                    <label><input type='checkbox' name='preferences'/> Bussiness</label>
                    <label><input type='checkbox' name='preferences'/> Entertainment</label>
                    <label><input type='checkbox' name='preferences'/> General</label>
                    <label><input type='checkbox' name='preferences'/> Health</label>
                    <label><input type='checkbox' name='preferences'/> Science</label>
                    <label><input type='checkbox' name='preferences'/> Sports</label>
                    <label><input type='checkbox' name='preferences'/> Technology</label>
                    </div>
                    <h5>Select Your Data Source</h5>
                    <div className='selectRadio allDetail'>
                    <label><input type='radio' id='dataSource-1'  name='dataSource'/> Best</label>  
                    <label><input type='radio' id='dataSource-2'  name='dataSource'/> My Designs</label>  
                    <label><input type='radio' id='dataSource-3'  name='dataSource'/> Check</label>  
                    </div>
                    <button onClick={saveSettings}>Save</button>
                    <button className='closePop' onClick={()=>{setShowPopup(false)}}>Cancel</button>
            </section>
        </div>}
        <div className="dmtop">Scroll to Top</div>
    </div>
    </div>
  )
}

export default Home;

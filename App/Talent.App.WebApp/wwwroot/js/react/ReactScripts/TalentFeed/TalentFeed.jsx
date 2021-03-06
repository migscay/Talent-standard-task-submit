import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie'
import TalentCard from '../TalentFeed/TalentCard.jsx';
import { Loader,Grid } from 'semantic-ui-react';
import CompanyProfile from '../TalentFeed/CompanyProfile.jsx';
import FollowingSuggestion from '../TalentFeed/FollowingSuggestion.jsx';
import { BodyWrapper, loaderData } from '../Layout/BodyWrapper.jsx';

export default class TalentFeed extends React.Component {
    constructor(props) {
        super(props);

        let loader = loaderData
        loader.allowedUsers.push("Employer")
        loader.allowedUsers.push("Recruiter")

        this.state = {
            employerData: {
                companyContact: { 
                    email: "",
                    firstName: "",
                    lastName: "",
                    location: {
                        city: "",
                        country: ""
                    },
                    name: "",
                    phone: ""
                }
            },
           talentList: [],
           loadNumber: 5,
           loadPosition: 0,
           feedData: [],
           watchlist: [],
           loaderData: loader,
           loadingFeedData: false,
           companyDetails: null
        }

        this.init = this.init.bind(this);
        this.loadEmployerData = this.loadEmployerData.bind(this);
        this.loadData = this.loadData.bind(this);
        this.updateWithoutSave = this.updateWithoutSave.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    };

    init() {
        let loader = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = false;
        this.loadEmployerData(() => this.setState({ loaderData }));
        loader = TalentUtil.deepCopy(this.state.loaderData);
        loaderData.isLoading = false;
        this.loadData(() => this.setState({ loaderData }))
        window.addEventListener('scroll', this.handleScroll);
    }

    componentDidMount() {
       this.init()
    };


    loadEmployerData(callback) {
        var cookies = Cookies.get('talentAuthToken');
        //get employer profile
        $.ajax({
            url: 'https://talent-profile.azurewebsites.net/profile/profile/getEmployerProfile',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                let employerData = null;
                if (res.employer) {
                    let newSD = Object.assign({}, this.state.employerData, res.employer)
                    this.setState({
                        employerData: newSD
                    })            
                }
            }.bind(this),
            error: function (res) {
                alert("employer not fetched")
                console.log(res.status)
            }
        }) 
    }

    loadData(callback) {
        var cookies = Cookies.get('talentAuthToken');
       $.ajax({ 
        url: 'https://talent-profile.azurewebsites.net/profile/profile/getTalent',
        headers: {
            'Authorization': 'Bearer ' + cookies,
            'Content-Type': 'application/json'
        },
        type: "GET",
        data: {
            position: this.state.loadPosition,
            number: this.state.loadNumber
        },
        contentType: "application/json",
        dataType: "json",
        success: function (res) {
            let talentList = null;
            if (res) {
                console.log("talentList", res.data)
            }
            this.updateWithoutSave(res.data)
            callback();
        }.bind(this),
        error: function (res) {
            console.log(res.status)
            callback();
        }
        }) 
    }

    handleScroll() {
    }

    updateWithoutSave(newValues) {
        //let newTalents = Object.assign({}, this.state.talentList, newValues)
        this.setState({
            talentList: newValues
        })        
    }
   
    render() {
        return (
           <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={4}>                        
                                <CompanyProfile employerData={this.state.employerData.companyContact} />
                            </Grid.Column>
                            <Grid.Column width={8}>                        
                                {console.log("passing",this.state.talentList)}
                                <TalentCard talentList={this.state.talentList} />
                            </Grid.Column>
                            <Grid.Column width={4}>
                                <FollowingSuggestion profiles={this.state.feedData} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
           </BodyWrapper>
        )
    }
}
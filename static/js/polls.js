var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;

// css style to align text to the center of it's container
var Align = {
  textAlign: 'center',
  fontFamily: 'EB Garamond'
};

// css to position progress text inside the progress bar
var progressText = {
  position: 'relative',
  left: '-130px',
  bottom: '5px',
  color: '#3c763d'
};

var origin = window.location.origin;

var PollForm = React.createClass({

  getInitialState: function(e){
    // set initial state of form inputs
    return {title: '', option: '', options: [], all_options: []}
  },

  handleTitleChange: function(e){
    //change title as the user types
    this.setState({title: e.target.value});
  },

  handleOptionChange: function(e){
    this.setState({option: e.target.value});
  },

  handleOptionAdd: function(e){
    //update poll options and reset options to an empty string
    this.setState({
    options: this.state.options.concat({name: this.state.option}),
    option: ''
    });
  },

  componentDidMount: function(){

    var url =  origin + '/api/polls/options'

    //get all options
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({all_options: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });

  },

  handleSubmit: function(e){
    e.preventDefault();
    var title = this.state.title;
    var options = this.state.options;

    var data = {'title': title, options: options.map(function(x){return x.name})};
    var url =  origin + '/api/polls'

    // make post request
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success: function(data){
        alert(data.message);
      }.bind(this),
      error: function(xhr, status, err){
        alert('Poll creation failed: ' + err.toString());
      }.bind(this)
    });
  },

  render: function(){

    var all_options = this.state.all_options.map(function(option){
                        return(<option key={option.id} value={option.name} />)
                      });

    return (
    <div>
      <form id="poll_form" className="form-signin" onSubmit={this.handleSubmit}>
        <h2 className="form-signin-heading" style={Align}>Create a poll</h2>

        <div className="form-group has-success">
          <label htmlFor="title" className="sr-only">Title</label>
          <input type="text" id="title" name="title" className="form-control" placeholder="Title" onChange={this.handleTitleChange} required autoFocus />
        </div>

        <div className="form-group has-success">
          <label htmlFor="option" className="sr-only">Option</label>
          <input list="option" className="form-control" placeholder="Option" onChange={this.handleOptionChange}
          value={this.state.option ? this.state.option: ''} autoFocus />
        </div>

        <datalist id="option">
          {all_options}
        </datalist>

        <div className="row form-group">
          <button className="btn btn-lg btn-success btn-block" type="button" onClick={this.handleOptionAdd}>Add option</button>
          <button className="btn btn-lg btn-success btn-block" type="submit">Save poll</button>
        </div>
        <br />
      </form>

      <div className="row">
      <h3 style={Align}>Live Preview</h3>

        {/* Blank column to position LivePreview properly */}
        <div className="col-sm-4">
        </div>

        <div className="col-sm-8">
          <LivePreview title={this.state.title} options={this.state.options} />
        </div>
      </div>
    </div>
    );
  }
});

var LivePreview = React.createClass({

  getInitialState: function(){
    return {selected_option: '', disabled: 0};
  },

  handleOptionChange: function(e){
    this.setState({selected_option: e.target.value });
  },


  voteHandler: function(e){
    e.preventDefault();

    var data = {"poll_title": this.props.title, "option": this.state.selected_option};

    //calls props handler
    this.props.voteHandler(data);

    //disable the button
    this.setState({disabled: 1});

  },

  render: function(){
    var options = this.props.options.map(function(option){

      if(option.name) {

        // calculate progress bar percentage
        var progress = Math.round((option.vote_count / this.props.total_vote_count) * 100) || 0

        return (
          <div key={option.name}>
            <input name="options" type="radio" value={option.name} onChange={this.handleOptionChange} /> {option.name}
            <br />
            <progress value={progress} max="100"></progress><small style={progressText}>{progress}%</small>
            <br />
          </div>
        );
      }
    }.bind(this));

    return(
      <div className="col-sm-6">
        <div className="panel panel-success">
          <div className="panel-heading">
            <h4>{this.props.title}</h4>
          </div>
          <div className="panel-body">
            <form onSubmit={this.voteHandler}>
              {options}
              <br />
              <button type="submit" disabled={this.state.disabled} className="btn btn-success btn-outline hvr-grow">Vote!</button> <small>{this.props.total_vote_count} votes so far</small>
            </form>
          </div>
        </div>
      </div>
    )
  }
});


var LivePreviewProps = React.createClass({

  voteHandler: function(data){

    var url =  origin + '/api/poll/vote'

    // make patch request
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'PATCH',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success: function(data){
        alert(data.message);
        this.setState({selected_option: ''});
        this.props.loadPollsFromServer();
      }.bind(this),
      error: function(xhr, status, err){
        alert('Poll creation failed: ' + err.toString());
      }.bind(this)
    });

  },


  render: function(){
    var polls = this.props.polls.Polls.map(function(poll){
      return (
        <LivePreview key={poll.title} title={poll.title} options={poll.options} total_vote_count={poll.total_vote_count} voteHandler={this.voteHandler} />
    );
  }.bind(this));

    return (
      <div className="row marketing">{polls}</div>
    );
  }
});

var AllPolls = React.createClass({

  getInitialState: function(){
    return {polls: {'Polls': []}};
  },

  loadPollsFromServer: function(){
    var url =  origin + '/api/polls'
    //make get request
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({polls: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function(){
    this.loadPollsFromServer()
  },

  render: function(){
    return (
      <LivePreviewProps polls={this.state.polls} loadPollsFromServer={this.loadPollsFromServer} />
    );
  }

});


var Poll = React.createClass({

  getInitialState: function(){
    return {poll: {}}
  },

  voteHandler: function(data){

    var url =  origin + '/api/poll/vote'

    // make patch request
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'PATCH',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success: function(data){
        alert(data.message);
        this.setState({selected_option: ''});
        this.props.loadPollsFromServer();
      }.bind(this),
      error: function(xhr, status, err){
        alert('Poll creation failed: ' + err.toString());
      }.bind(this)
    });

  },


  componentDidMount: function(){
    var location = window.location.pathname
    var url =  origin + '/api/poll' + location
    //make get request
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({poll: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  render: function(){
    return (
      <LivePreview key={poll.title} title={this.state.poll.title} options={this.state.poll.options} total_vote_count={this.state.poll.total_vote_count} voteHandler={this.voteHandler} />
    )}

});

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={AllPolls} />
    <Route path="/polls" component={PollForm} />
  </Router>
  ),
  document.getElementById('container')
);

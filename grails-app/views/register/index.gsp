<head>
<title><g:message code='spring.security.ui.register.title'/></title>
<meta name='layout' content='main'/>
<script>
$(document).ready(function() {
	$('#username').focus();
});
</script>
</head>

<body>

  <div id="pageBody">

    <g:form action='register' name='registerForm' id="registerForm">

      <g:hasErrors>
        <div class="errors">
          <g:renderErrors as="list" />
        </div>
      </g:hasErrors>

    	<g:if test='${emailSent}'>
    	<br/>
    	<g:message code='spring.security.ui.register.sent'/>
    	</g:if>
    	<g:else>
      
      <h1>Register to MapHub</h1>
      <p>Fill in some basic details here:</p>
      <p>
        <label for="username"><g:message code='spring.security.ui.login.username'/></label>
        <input name="username" id="username" size="40"/>
        <br/>
        <label for="email">E-Mail:</label>
        <input name="email" size="40"/>
      </p>
      <br>
      <p>Choose your password. For safety reasons, passwords must have at least 8 characters, at least one letter, number, and special character: !@#$%^&</p>
      <p>
        <label for="password">Password: </label>
        <input type="password" size="40" name="password"/>
        <br/>
        <label for="password2">Password (repeat): </label>
        <input type="password" size="40" name="password2"/>        
      </p>
      <br>
      <p>
        By registering, you accept our <g:link controller="home" action="tos">Terms of Service</g:link>.
      </p>
    	<p><input type="submit" id="#create" value="Register" /></p>

    	</g:else>

    </g:form>

  </div>
</body>


</body>
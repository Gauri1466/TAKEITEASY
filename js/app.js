document.getElementById('register-form').classList.add('loading');

try {
    // Create user with Firebase Authentication
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password);
    const user = userCredential.user;

    // Save additional user data in Firestore
    await firebase.firestore().collection('users').doc(user.uid).set({
        name: formData.name,
        age: formData.age,
        address: formData.address,
        phone: formData.phone,
        email: formData.email
    });

    document.getElementById('success-message').textContent = 'Registration successful!';
    document.getElementById('success-message').style.display = 'block';

    // Clear form
    document.getElementById('register-form').reset();

} catch (error) {
    document.getElementById('error-message').textContent = error.message;
    document.getElementById('error-message').style.display = 'block';
} finally {
    // Remove loading state
    document.getElementById('register-form').classList.remove('loading');
}

document.getElementById('togglePassword').addEventListener('click', () => {
    const pass = document.getElementById('password');
    pass.type = pass.type === 'password' ? 'text' : 'password';
  });

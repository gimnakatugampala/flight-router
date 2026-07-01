const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false // This ensures the password isn't returned by default in GET requests
    },
    role: {
      type: String,
      enum: ['customer', 'staff', 'admin'],
      default: 'customer'
    }
  },
  {
    timestamps: true
  }
);

// 2. Encrypt password using bcrypt BEFORE saving
userSchema.pre('save', async function (next) {
  // If the password wasn't modified (e.g., updating just the name), skip this
  if (!this.isModified('password')) {
    next();
  }

  // Generate a 'salt' (random data added to the password before hashing)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password with the salt and replace the plain text password
  this.password = await bcrypt.hash(this.password, salt);
});

// 3. Create a custom method to check if an entered password matches the hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  // preventing the browser to post the data
  // & letting js+axios do the work
  // so that user wouldn't have to refresh page
  // in order to see the white heart/red heart + heart count update
  e.preventDefault();
  console.log('HEART ITTT!!!!!!!!!!!!!!!!');
  // 'this' is the form tag with the class heart we clicked on
  console.log(this);
  axios
    .post(this.action)
    .then(res => {
      // console.log(res.data);
      // this.heart gives u the button with the name="heart"
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      // res.data gives u the user, hearts the user's hearts array
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted) {
        // see details of the animation in heart.scss
        this.heart.classList.add('heart__button--float');
        // thanks to the arrow function 'this' still refers to the actual form tag
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
      }
    })
    .catch(console.error);
}

export default ajaxHeart;

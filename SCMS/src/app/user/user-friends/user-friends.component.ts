import { Component, Input, OnInit } from '@angular/core';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { stagger40ms } from 'src/@vex/animations/stagger.animation';
import { UserService } from '../user.service';

@Component({
  selector: 'vex-user-friends',
  templateUrl: './user-friends.component.html',
  styleUrls: ['./user-friends.component.scss'], animations: [
    fadeInUp400ms,
    fadeInRight400ms,
    scaleIn400ms,
    stagger40ms
  ]
})
export class UserFriendsComponent implements OnInit {
  @Input() suggestions:any[];

  constructor(private userService:UserService) {
// this.loadingFriends();
  }

  ngOnInit(): void {
  }


  addFriend(friend: any) {
  this.userService.acceptFriendship(friend.id);
  this.loadingFriends();

  }
  AbrveFrindes(friend: any) {
    this.userService.AbrveFrindes(friend.id);
    this.loadingFriends();

    }

  removeFriend(friend: any) {
    console.log(friend);
    this.userService.deleteFriends(friend.id).subscribe((rep) => {
     this.suggestions.splice(
      this.suggestions.findIndex((v,b)=>b===friend.id),1);
     this.loadingFriends();
    });


  }

  trackByName(index: number, friend: any) {
    return friend.is_friend_request_by_me;
  }

  loadingFriends() {

}

}

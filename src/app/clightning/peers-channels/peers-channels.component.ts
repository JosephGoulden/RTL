import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { faUsers, faChartPie } from '@fortawesome/free-solid-svg-icons';

import { GetInfoCL, PeerCL } from '../../shared/models/clModels';
import { CLOpenChannelComponent } from './channels/open-channel-modal/open-channel.component';
import { SelNodeChild } from '../../shared/models/RTLconfig';

import * as RTLActions from '../../store/rtl.actions';
import * as fromRTLReducer from '../../store/rtl.reducers';

@Component({
  selector: 'rtl-cl-peers-channels',
  templateUrl: './peers-channels.component.html',
  styleUrls: ['./peers-channels.component.scss']
})
export class CLPeersChannelsComponent implements OnInit, OnDestroy {
  public selNode: SelNodeChild = {};
  public information: GetInfoCL = {};
  public peers: PeerCL[] = [];
  public totalBalance = 0;
  public activePeers = 0;
  public activeChannels = 0;
  public faUsers = faUsers;
  public faChartPie = faChartPie;
  public balances = [{title: 'Total Balance', dataValue: 0}, {title: 'Confirmed', dataValue: 0}, {title: 'Unconfirmed', dataValue: 0}];
  private unSubs: Array<Subject<void>> = [new Subject(), new Subject(), new Subject(), new Subject()];

  constructor(private store: Store<fromRTLReducer.RTLState>, private actions$: Actions) {}

  ngOnInit() {
    this.store.select('cl')
    .pipe(takeUntil(this.unSubs[1]))
    .subscribe((rtlStore) => {
      this.selNode = rtlStore.nodeSettings;
      this.information = rtlStore.information;    
      this.peers = rtlStore.peers;
      this.activePeers = (rtlStore.peers && rtlStore.peers.length) ? rtlStore.peers.length : 0;
      this.activeChannels = rtlStore.information.num_active_channels;
      this.totalBalance = rtlStore.balance.totalBalance;
      this.balances = [{title: 'Total Balance', dataValue: rtlStore.balance.totalBalance || 0}, {title: 'Confirmed', dataValue: rtlStore.balance.confBalance}, {title: 'Unconfirmed', dataValue: rtlStore.balance.unconfBalance}];
    });
  }

  onOpenChannel() {
    const peerToAddChannelMessage = {
      peers: this.peers, 
      information: this.information,
      balance: this.totalBalance
    };
    this.store.dispatch(new RTLActions.OpenAlert({ data: { 
      alertTitle: 'Open Channel',
      message: peerToAddChannelMessage,
      component: CLOpenChannelComponent
    }}));
  }

  ngOnDestroy() {
    this.unSubs.forEach(completeSub => {
      completeSub.next();
      completeSub.complete();
    });
  }

}

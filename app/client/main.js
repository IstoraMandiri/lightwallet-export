import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import lightwallet from 'eth-lightwallet'

console.log('lw', lightwallet)

import './main.html'

Template.import.onCreated(function () {
  // counter starts at 0
  this.key = new ReactiveVar()
})

Template.import.helpers({
  key () {
    return Template.instance().key.get()
  }
})

Template.import.events({
  'change input' (e, tmpl) {
    // TODO import old wallet style
    const file = e.target.files[0]
    const fr = new FileReader()
    fr.onload = function (file) {
      // check if we have this account added already
      const password = prompt('Enter Password')
      lightwallet.upgrade.upgradeOldSerialized(file.target.result, password, function (err, res) {
        if (err) { alert(err) }
        console.log('got keystore', res)
        const ks = lightwallet.keystore.deserialize(res)
        lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {
          let privateKey
          try {
            privateKey = ks.exportPrivateKey(ks.getAddresses()[0], pwDerivedKey)
          } catch (e) {
            alert(e)
          }
          tmpl.key.set(privateKey)
        })
      })
    }
    fr.readAsText(file)
  },
  'click button' (e, tmpl) {
    const text =  tmpl.key.get()
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', 'key_file.txt')
    element.click()
  }
})

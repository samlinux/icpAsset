import TrieMap "mo:base/TrieMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor {

  public type Key = Text;
  public type Asset = {
    name : Text; 
    age : Nat; 
    desc : Text
  };

  stable var assetBackup : [(Key, Asset)] = [];
  var assetStore = TrieMap.fromEntries<Key, Asset>(assetBackup.vals(), Text.equal, Text.hash);

  public func addAsset(key: Text, name : Text, age : Nat, desc : Text) : async () {
    assetStore.put (key, {name = name; age = age; desc = desc});
  };

  public func getAsset(key:Text) : async ?Asset {
    return assetStore.get(key);
  };

  public func removeAsset(key:Text) : async () {
    assetStore.delete(key);
  };

  public query func getAllAssets(): async [(Key, Asset)] {
    Iter.toArray(assetStore.entries());
  };

  public query func getAssetsCount(): async Nat {
    assetStore.size();
  };

  public query func filterAssets(filter: Text) : async [(Key, Asset)] {
    Iter.toArray(
        TrieMap.mapFilter<Key, Asset, Asset>(
          assetStore,
          Text.equal,
          Text.hash,
          func(k, v) {
            if (Text.contains(v.name, #text filter)) {
                ?v
            } else {
             null
            }
          }
        ).entries()
      );
  };

  system func preupgrade(){
    assetBackup := Iter.toArray(assetStore.entries());
  };

  system func postupgrade(){
      assetBackup := [];
  }

};

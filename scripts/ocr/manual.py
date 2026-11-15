import json,re
s=json.load(open('secs_c.json'))
E=[(4,'(5)','(b)'),(6,'(2) by the communication','(a) by the communication'),(6,'proposa!','proposal'),(14,' ta ',' to '),(15,' 9 commit',' to commit'),
(16,'patties','parties'),(22,' ty a matter',' to a matter'),(22,' ty ',' to '),(25,'a eement','agreement'),(27,'business of of any','business of any'),(27,'(0) partners','(b) partners'),
(36,'anything, of an impossible','anything, if an impossible'),(36,'parties. Pan to the','parties to the'),(36,'not to the parties. Pan to','not to the parties to'),
(38,'perforMance','performance'),(38,'not does','nor does'),(38,'a_ ','a '),(40,' r i jen',''),(41,'{rom','from'),(44,' ata',''),(66,'niles','rules'),(66,'subject. to','subject to'),
(80,' o1 ',' or '),(84,'is Called','is called'),(89,'"uarantee','guarantee'),(92,' on: ',' '),(103,' und ',' and '),(108,'therm,','them,'),(110,' i8 ',' is '),(118,'hailed','bailed'),
(127,'(8) when','(b) when'),(133,'preserva-HO','preservation'),(135,' ot ',' or '),(136,'er documents','or documents'),(138,'(ili)','(iii)'),(140,'cither','either'),
(154,'principal i the','principal in the'),(156,' lect ',' elect '),(156,'by is authority','by his authority'),(161,'cither','either'),(169,' vr ',' or '),(173,' bis ',' his '),
(177,' duc ',' due '),(184,'implied Promise,','implied promise,'),(187,'authorised to 0,','authorised to do,'),(187,' Als ',' his '),(191,' tu ',' to '),(197,' gr ',' or '),(9,'said to he express','said to be express'),(19,'discoveri ng','discovering'),(28,' une party',' one party'),(186,'may be.. ve enforced','may be enforced'),
(192,'perform ance','performance'),(194,'that the ae.;: os principal','that the principal'),(25,'other: or unless + 3 te, sy,: ] () it','other; or unless (b) it'),(25,'other: or unless () it','other; or unless (b) it'),
(14,'section 15: or','section 15; or'),(14,'section 17: or','section 17; or'),(135,'from Ins default','from his default'),(1,'Contract Law,','Contract Law.'),
(20,'caused by Undue','caused by undue'),(26,'the Marriage','the marriage'),(28,'class of Subjects','class of subjects'),(37,'or Offer to','or offer to'),(69,'who Is interested','who is interested'),
(82,'save the Other','save the other'),(83,'acting Within','acting within'),(110,'is Not responsible','is not responsible'),(126,'for Compensation','for compensation'),
(174,'his Principal','his principal'),(181,'property, Whether','property, whether'),(186,'and Obligations','and obligations'),(192,'to Suspect','to suspect'),(154,'agency as ned 2; =. is entrusted','agency as is entrusted'),(185,"principal's i 5 y P P neglect","principal's neglect"),(94,'iS Made','is made'),(25,'shall affect. the','shall affect the')]
miss=[]
for k,a,b in E:
    ps=s[str(k)]['paras']; done=False
    for i,p in enumerate(ps):
        if a in p: ps[i]=p.replace(a,b,1); done=True; break
    if not done: miss.append((k,a))
s['139']['paras']=["In the absence of any stipulations to the contrary contained in a contract of pledge made in accordance with the provisions of the last preceding section, the pawnee shall, in case the pawnor makes default in the payment of the debt or the performance of the promise at the stipulated time, have the same rights and remedies on the pledge against third parties as the pawnor himself would have had but for the contract of pledge, and all payments made to the pawnee by third parties on such pledge shall be as valid and effective as if made to the pawnor himself."]
s['154']['paras']=[p for p in s['154']['paras'] if 'alarei' not in p]
json.dump(s,open('secs_m.json','w'),ensure_ascii=False,indent=0)
print('missed',miss)
